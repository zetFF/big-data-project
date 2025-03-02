<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\TicketStatusUpdated;
use App\Notifications\NewTicketAssigned;
use Illuminate\Support\Facades\Notification;

class SupportTicketService
{
    public function createTicket(array $data, User $user): SupportTicket
    {
        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'open',
            'category' => $data['category'],
            'order_id' => $data['order_id'] ?? null
        ]);

        if (isset($data['attachments'])) {
            foreach ($data['attachments'] as $attachment) {
                $ticket->addMedia($attachment)
                    ->toMediaCollection('attachments');
            }
        }

        $this->assignTicket($ticket);
        return $ticket;
    }

    public function assignTicket(SupportTicket $ticket): void
    {
        // Find available support agent based on workload
        $agent = User::role('support_agent')
            ->withCount('assignedTickets')
            ->orderBy('assigned_tickets_count', 'asc')
            ->first();

        if ($agent) {
            $ticket->update(['assigned_to' => $agent->id]);
            $agent->notify(new NewTicketAssigned($ticket));
        }
    }

    public function updateTicketStatus(SupportTicket $ticket, string $status, ?string $response = null): void
    {
        $ticket->update([
            'status' => $status,
            'last_response' => $response,
            'last_response_at' => now()
        ]);

        $ticket->user->notify(new TicketStatusUpdated($ticket));
    }

    public function addResponse(SupportTicket $ticket, string $response, User $responder): void
    {
        $ticket->responses()->create([
            'user_id' => $responder->id,
            'content' => $response,
            'is_agent_response' => $responder->hasRole('support_agent')
        ]);

        if ($responder->hasRole('support_agent')) {
            $ticket->update(['status' => 'answered']);
        } else {
            $ticket->update(['status' => 'customer_reply']);
        }
    }

    public function getTicketMetrics(): array
    {
        return [
            'open' => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'average_response_time' => $this->calculateAverageResponseTime(),
            'satisfaction_rate' => $this->calculateSatisfactionRate()
        ];
    }

    private function calculateAverageResponseTime(): float
    {
        return SupportTicket::whereNotNull('first_response_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, first_response_at)) as avg_response_time')
            ->value('avg_response_time') ?? 0;
    }
} 