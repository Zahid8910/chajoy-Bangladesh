<?php
declare(strict_types=1);

final class Database
{
    public static function connect(): PDO
    {
        $host = getenv('CHAJOY_DB_HOST') ?: '127.0.0.1';
        $port = getenv('CHAJOY_DB_PORT') ?: '3306';
        $database = getenv('CHAJOY_DB_NAME') ?: 'ChaJoy';
        $username = getenv('CHAJOY_DB_USER') ?: 'root';
        $password = getenv('CHAJOY_DB_PASSWORD') ?: '';

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

        return new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
