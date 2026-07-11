<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (App\Models\User::all(['name','email']) as $u) {
    echo $u->name . ' | ' . $u->email . PHP_EOL;
}
