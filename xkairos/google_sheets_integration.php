<?php
// Google Sheets Integration for Leads and Requests
// Note: Requires Google API Client installed via Composer: composer require google/apiclient
// And credentials.json file in the root directory

if (!file_exists('vendor/autoload.php')) {
    die('Google API Client not installed. Run: composer require google/apiclient');
}

require 'vendor/autoload.php'; // Google API Client

use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;

function addToGoogleSheets($data) {
    try {
        if (!file_exists('credentials.json')) {
            return ['status' => 'error', 'message' => 'Arquivo credentials.json não encontrado. Configure as credenciais do Google API.'];
        }

        $client = new Client();
        $client->setApplicationName('Xkairos Tech CRM');
        $client->setScopes([Sheets::SPREADSHEETS]);
        $client->setAuthConfig('credentials.json'); // Path to your Google API credentials

        $service = new Sheets($client);

        $spreadsheetId = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheets ID
        $range = 'Leads!A1'; // Sheet name and starting cell

        $values = [
            [$data['nome'], $data['email'], $data['cpu'], $data['gpu'], $data['ram'], $data['ssd'], $data['total'], date('Y-m-d H:i:s')]
        ];
        $body = new ValueRange([
            'values' => $values
        ]);

        $params = [
            'valueInputOption' => 'RAW'
        ];

        $result = $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);
        return ['status' => 'success', 'result' => $result];
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => $e->getMessage()];
    }
}

// Example usage: Call this function after inserting into DB in configurator.php
// $result = addToGoogleSheets(['nome' => $nome, 'email' => $email, 'cpu' => $cpu, 'gpu' => $gpu, 'ram' => $ram, 'ssd' => $ssd, 'total' => $total]);
// if ($result['status'] === 'error') { echo 'Erro ao salvar no Google Sheets: ' . $result['message']; }
?>
