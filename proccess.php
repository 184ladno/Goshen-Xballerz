<?php
/*
 * Contact form handler for contact.html.
 *
 * Sends each enquiry through Gmail (SMTP) using PHPMailer, so it works on
 * your own computer and on any PHP hosting.
 *
 * Setup: copy mail-config.example.php to mail-config.php and fill it in.
 * Run locally with:  php -S localhost:8000   then open
 * http://localhost:8000/contact.html  (Live Server / double-clicking the
 * file will NOT run PHP).
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

// Never print PHP warnings into the reply (it would break the form's response).
ini_set('display_errors', '0');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(bool $ok, string $message, int $status, bool $wantsJson): void
{
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        // Without JavaScript: go back to the contact page with the result.
        header('Location: contact.html?sent=' . ($ok ? '1' : '0') . '#contact-form');
    }
    exit;
}

const SEND_FAILED = 'Sorry, your message could not be sent. Please call or email us instead.';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Please use the contact form.', 405, $wantsJson);
}

// Spam trap: real visitors never see or fill the "website" field.
if (!empty($_POST['website'])) {
    respond(true, 'Thanks, your message has been sent.', 200, $wantsJson);
}

// Collect and clean the fields.
function field(string $name, int $maxLength): string
{
    $value = isset($_POST[$name]) ? trim((string) $_POST[$name]) : '';
    return mb_substr($value, 0, $maxLength);
}

$name     = str_replace(["\r", "\n"], ' ', field('name', 100));
$email    = field('email', 200);
$interest = str_replace(["\r", "\n"], ' ', field('interest', 100));
$message  = field('message', 5000);

if ($name === '' || $email === '' || $interest === '' || $message === '') {
    respond(false, 'Please fill in every field.', 422, $wantsJson);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 422, $wantsJson);
}

// Load the email settings.
$configFile = __DIR__ . '/mail-config.php';
if (!is_file($configFile)) {
    error_log('Contact form: mail-config.php is missing. Copy mail-config.example.php to mail-config.php and fill it in.');
    respond(false, SEND_FAILED, 500, $wantsJson);
}
$config = require $configFile;
$appPassword = str_replace(' ', '', $config['gmail_app_password'] ?? '');
if ($appPassword === '' || $appPassword === 'xxxxxxxxxxxxxxxx') {
    error_log('Contact form: set gmail_app_password in mail-config.php.');
    respond(false, SEND_FAILED, 500, $wantsJson);
}

// Build and send the email through Gmail.
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->Port       = 587;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['gmail_address'];
    $mail->Password   = $appPassword;
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 15;

    // Gmail only sends "from" the account that logged in.
    $mail->setFrom($config['gmail_address'], 'Goshen XBallerz website');
    $mail->addAddress($config['recipient'] ?? $config['gmail_address']);
    $mail->addReplyTo($email, $name); // pressing "Reply" answers the parent directly

    $mail->Subject = 'New coaching enquiry: ' . $interest;
    $mail->Body = "New enquiry from the Goshen XBallerz website\n\n"
                . "Name: {$name}\n"
                . "Email: {$email}\n"
                . "Coaching interest: {$interest}\n\n"
                . "Message:\n{$message}\n";

    $mail->send();
    respond(true, "Thanks, your message has been sent. We'll get back to you soon.", 200, $wantsJson);
} catch (MailException $e) {
    // The real reason goes to the server log (and the terminal when using php -S).
    error_log('Contact form: email failed: ' . $mail->ErrorInfo);
    respond(false, SEND_FAILED, 500, $wantsJson);
}
