<?php

namespace App\Http\Controllers;

use App\Models\RegForm;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use App\Models\Country;
use App\Models\States;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Exception as ReaderException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;


class ExcelController extends Controller
{
    public function generateExcel()
    {
        try {
            // Create a new Spreadsheet object
            $spreadsheet = new Spreadsheet();
            
            // Set document properties
            $spreadsheet->getProperties()
                ->setCreator('Abhisek')
                ->setTitle('User Information')
                ->setLastModifiedBy('Abhisek')
                ->setDescription('User data for reporting')
                ->setSubject('User Information')
                ->setKeywords('phpspreadsheet, user, data, export')
                ->setCategory('Import');
    
            // Get the active sheet and set its title
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Userdata');
    
            // Define headers for main data sheet
            $headers = [
                'name', 'email', 'phone', 'dob', 'address', 'country', 'state', 'username', 'gender', 'hobbies'
            ];
    
            // Set headers in the first row
            foreach ($headers as $key => $header) {
                $sheet->setCellValueByColumnAndRow($key + 1, 1, $header);
            }
    
            // Apply styling to headers
            $headerStyle = [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => '00ffff00']]
            ];
            $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);
    
            // Set column widths
            foreach ($headers as $key => $header) {
                $sheet->getColumnDimensionByColumn($key + 1)->setAutoSize(true);
            }
    
            // Fetch hobbies and gender data
            $hobbiesArray = [
                1 => 'Cricket',
                2 => 'Cooking',
                4 => 'Travelling',
            ];
    
            $genderArray = [
                1 => 'Male',
                2 => 'Female',
            ];
    
            // Create a new sheet for reference data
            $referenceSheet = $spreadsheet->createSheet(0);
            $referenceSheet->setTitle('Reference');
    
            // Headers for reference sheet
            $referenceHeaders = [
                'Country ID', 'Country Name', 'State ID', 'State Name', 'c_id', 'Hobbies', 'Gender'
            ];
    
            // Set headers in reference sheet
            foreach ($referenceHeaders as $key => $header) {
                $referenceSheet->setCellValueByColumnAndRow($key + 1, 1, $header);
            }
    
            // Apply styling to reference headers
            $referenceSheet->getStyle('A1:G1')->applyFromArray($headerStyle);
    
            // Set column widths for reference sheet
            foreach ($referenceHeaders as $key => $header) {
                $referenceSheet->getColumnDimensionByColumn($key + 1)->setAutoSize(true);
            }
    
            // Populate hobbies and gender data in reference sheet
            foreach ($hobbiesArray as $id => $hobby) {
                $referenceSheet->setCellValue('F' . ($id + 1), $hobby);
            }
    
            foreach ($genderArray as $id => $gender) {
                $referenceSheet->setCellValue('G' . ($id + 1), $gender);
            }
    
            // Fetch country and state data using models
            $countries = Country::all();
            $states = States::all();
    
            // Populate country data in reference sheet
            foreach ($countries as $key => $country) {
                $referenceSheet->setCellValue('A' . ($key + 2), $country->id);
                $referenceSheet->setCellValue('B' . ($key + 2), $country->country_name);
            }
    
            // Populate state data in reference sheet
            foreach ($states as $key => $state) {
                $referenceSheet->setCellValue('C' . ($key + 2), $state->sid);
                $referenceSheet->setCellValue('D' . ($key + 2), $state->state_name);
                $referenceSheet->setCellValue('E' . ($key + 2), $state->country_id);
            }
    
            // Fetch user data using DB facade
            $userData = DB::table('regforms')->get();
    
            // Populate user data in main sheet
            foreach ($userData as $key => $user) {
                $sheet->setCellValue('A' . ($key + 2), $user->name);
                $sheet->setCellValue('B' . ($key + 2), $user->email);
                $sheet->setCellValue('C' . ($key + 2), $user->phone);
                $sheet->setCellValue('D' . ($key + 2), $user->dob);
                $sheet->setCellValue('E' . ($key + 2), $user->address);
                $sheet->setCellValue('F' . ($key + 2), $user->country);
                $sheet->setCellValue('G' . ($key + 2), $user->state);
                $sheet->setCellValue('H' . ($key + 2), $user->username);
                $sheet->setCellValue('I' . ($key + 2), $user->gender);
                $sheet->setCellValue('J' . ($key + 2), $user->hobbies);
            }
    
            // Save spreadsheet to storage
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $filename = 'user_information.xlsx';
            $writer->save(storage_path('app/public/' . $filename));
    
            // Return the file as download response
            return response()->download(storage_path('app/public/' . $filename))->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            // Handle exceptions
            return response()->json(['error' => 'Error generating Excel file. ' . $e->getMessage()], 500);
        }
    }
    public function excelValidation(Request $request)
    {
        try {
            // Validate the uploaded file
            $validator = Validator::make($request->all(), [
                'spreadsheetfile' => 'required|mimes:xlsx,xls|max:2048' // Adjust max file size as needed
            ]);
    
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()->all()], 400);
            }
    
            // Process the uploaded Excel file
            $file = $request->file('spreadsheetfile');
    
            // Load spreadsheet
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
    
            // Fetch data from the spreadsheet
            $excelData = [];
            $headers = [];
    
            foreach ($sheet->getRowIterator() as $row) {
                $rowArray = [];
    
                foreach ($row->getCellIterator() as $cell) {
                    if ($cell->getRow() === 1) {
                        // Store headers for validation
                        $headers[] = $cell->getValue();
                    } else {
                        // Store data rows
                        $rowArray[] = $cell->getValue();
                    }
                }
    
                if (!empty($rowArray)) {
                    $excelData[] = array_combine($headers, $rowArray);
                }
            }
    
            $validationErrors = [];
    
            // Fetch all countries and states from the database
            $countries = Country::pluck('id')->toArray();
            $states = States::pluck('sid')->toArray();
    
            foreach ($excelData as $rowIndex => $row) {
                // Validate 'country' against 'id' in the database
                if (!isset($row['country']) || !in_array($row['country'], $countries)) {
                    $validationErrors[] = 'Invalid country or missing data at row ' . ($rowIndex + 2) . ' in column "country"';
                }
    
                // Validate 'state' against 'id' in the database
                if (!isset($row['state']) || !in_array($row['state'], $states)) {
                    $validationErrors[] = 'Invalid state or missing data at row ' . ($rowIndex + 2) . ' in column "state"';
                }
            }
    
            // Return response based on validation result
            if (!empty($validationErrors)) {
                return response()->json(['errors' => $validationErrors], 400);
            }
    
            // Return validated data
            return response()->json(['excelData' => $excelData], 200);
        } catch (ReaderException $e) {
            return response()->json(['error' => 'Error reading uploaded file. ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error validating Excel file. ' . $e->getMessage()], 500);
        }
    }
    
    
    public function uploadExcel(Request $request)
    {
        // Validate the request
        $request->validate([
            'spreadsheetfile' => 'required|mimes:xlsx,xls|max:2048', // Adjust file types and size limit as needed
        ]);

        // Process the uploaded file
        if ($request->hasFile('spreadsheetfile')) {
            $file = $request->file('spreadsheetfile');

            try {
                // Load spreadsheet
                $spreadsheet = IOFactory::load($file->getPathname());
                $sheet = $spreadsheet->getActiveSheet();
    
                // Fetch data from the spreadsheet
                $excelData = [];
                $headers = [];
    
                foreach ($sheet->getRowIterator() as $row) {
                    $rowArray = [];
    
                    foreach ($row->getCellIterator() as $cell) {
                        if ($cell->getRow() === 1) {
                            // Store headers for validation
                            $headers[] = $cell->getValue();
                        } else {
                            // Store data rows
                            $rowArray[] = $cell->getValue();
                        }
                    }
    
                    if (!empty($rowArray)) {
                        $excelData[] = array_combine($headers, $rowArray);
                    }
                }

                // Process each row from Excel data
                foreach ($excelData as $data) {
                    // Example assuming 'username' is unique identifier for User model
                    $existingUser = RegForm::where('email', $data['email'])->first();

                    if ($existingUser) {
                        // Update existing user details
                        $existingUser->update([
                            'name' => $data['name'],
                            'email' => $data['email'],
                            'phone' => $data['phone'],
                            'dob' => $data['dob'],
                            'address' => $data['address'],
                            'country' => $data['country'],
                            'state' => $data['state'],
                            'gender' => $data['gender'],
                            'hobbies' => $data['hobbies'],
                        ]);
                    } else {
                        // Insert new user details
                        $defaultPassword = 'password'; // Change this to your desired default password
                        $hashedPassword = Hash::make($defaultPassword);
                        RegForm::create([
                            'name' => $data['name'],
                            'email' => $data['email'],
                            'phone' => $data['phone'],
                            'dob' => $data['dob'],
                            'address' => $data['address'],
                            'country' => $data['country'],
                            'state' => $data['state'],
                            'username' => $data['username'],
                            'gender' => $data['gender'],
                            'hobbies' => $data['hobbies'],
                            'password' =>$hashedPassword,
                        ]);
                    }
                }

                // Return success response
                return response()->json(['message' => 'File uploaded successfully'], 200);

            } catch (ReaderException $e) {
                return response()->json(['error' => 'Error reading uploaded file. ' . $e->getMessage()], 500);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error processing uploaded file. ' . $e->getMessage()], 500);
            }

        }

        // Return error response if file not found
        return response()->json(['error' => 'File not found'], 404);
    }

}
