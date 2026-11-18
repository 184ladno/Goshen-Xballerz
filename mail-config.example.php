<?php
/*
 * Email settings for the contact form.
 *
 * 1. Copy this file and name the copy  mail-config.php  (same folder).
 * 2. Fill in the values below in mail-config.php.
 *
 * mail-config.php holds your password, so it is listed in .gitignore and
 * is never committed. Upload it to your hosting by hand.
 */

return [
    // The Gmail account that sends the emails.
    'gmail_address' => 'ais184nana@gmail.com',

    // A Gmail "app password" (16 letters), NOT your normal Gmail password.
    // Create one at https://myaccount.google.com/apppasswords
    // (2-Step Verification must be turned on first).
    'gmail_app_password' => 'xxxx xxxx xxxx xxxx',

    // Where enquiries are delivered. Can be the same Gmail address.
    'recipient' => 'ais184nana@gmail.com',
];
