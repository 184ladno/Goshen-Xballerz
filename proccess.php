<?php
/*
 * Contact form handler for contact.html.
 * Emails each enquiry to the address below.
 *
 * Needs a host that runs PHP and can send email with mail()
 * (most shared hosting does). It will NOT work when opening the
 * site straight from your computer or on GitHub Pages.
 */

// Where enquiries are sent.
const RECIPIENT = 'ais184nana@gmail.com';

// Sender address shown on the email. Use an address on your own website's
// domain (e.g. no-reply@yourdomain.co.uk): many email providers, including
// Gmail, reject or spam-folder mail "from" a domain the server doesn't own.
// Left empty, it uses no-reply@ + the website's domain automatically.
const FROM_ADDRESS = '';

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

$name     = field('name', 100);
$email    = field('email', 200);
$interest = field('interest', 100);
$message  = field('message', 5000);

// Strip line breaks from single-line fields so they can't inject email headers.
$name     = str_replace(["\r", "\n"], ' ', $name);
$interest = str_replace(["\r", "\n"], ' ', $interest);

if ($name === '' || $email === '' || $interest === '' || $message === '') {
    respond(false, 'Please fill in every field.', 422, $wantsJson);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 422, $wantsJson);
}

// Build the email.
$host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
$host = preg_replace('/:\d+$/', '', $host); // drop any port number
$host = preg_replace('/[^a-z0-9.\-]/i', '', $host);
$from = FROM_ADDRESS !== '' ? FROM_ADDRESS : 'no-reply@' . $host;

$subject = 'New coaching enquiry: ' . $interest;
$body = "New enquiry from the Goshen XBallerz website\n\n"
      . "Name: {$name}\n"
      . "Email: {$email}\n"
      . "Coaching interest: {$interest}\n\n"
      . "Message:\n{$message}\n";

$headers = [
    'From' => 'Goshen XBallerz website <' . $from . '>',
    'Reply-To' => $email, // pressing "Reply" answers the parent directly
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'PHP',
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

if (mail(RECIPIENT, $encodedSubject, $body, $headers)) {
    respond(true, "Thanks, your message has been sent. We'll get back to you soon.", 200, $wantsJson);
}

respond(false, 'Sorry, your message could not be sent. Please call or email us instead.', 500, $wantsJson);
