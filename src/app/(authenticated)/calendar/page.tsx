"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Calendar as CalendarIconLucide, CalendarDays, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Agenda"
        description="View your schedule, upcoming deadlines, and project milestones."
        icon={CalendarDays}
        actions={<Button><PlusCircle className="mr-2 h-4 w-4"/>New Event</Button>}
      />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly View</CardTitle>
            <CardDescription>
              Full calendar integration for events, tasks, and deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                numberOfMonths={1}
             />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Your agenda for the next few days.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
             <p className="text-muted-foreground">Agenda view coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
