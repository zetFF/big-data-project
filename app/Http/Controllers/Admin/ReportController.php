<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SalesExport;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index(Request $request)
    {
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        $salesReport = $this->reportService->getSalesReport($startDate, $endDate);
        $topProducts = $this->reportService->getTopProducts();
        $vendorPerformance = $this->reportService->getVendorPerformance();

        return Inertia::render('Admin/Reports', [
            'salesReport' => $salesReport,
            'topProducts' => $topProducts,
            'vendorPerformance' => $vendorPerformance,
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        return Excel::download(
            new SalesExport($startDate, $endDate),
            'sales-report.xlsx'
        );
    }
} 