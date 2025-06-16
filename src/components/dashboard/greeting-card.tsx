"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Lightbulb, Zap } from "lucide-react";

interface GreetingCardProps {
  userName: string;
}

export function GreetingCard({ userName }: GreetingCardProps) {
  const [greeting, setGreeting] = useState("");
  const [dateFact, setDateFact] = useState("");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Example of dynamic content based on date (client-side)
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setDateFact(`Happy ${day}! Here's to a productive day.`);
  }, []);

  const motivationalQuotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don’t watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "Believe you can and you're halfway there. - Theodore Roosevelt"
  ];
  
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);


  return (
    <Card className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">{greeting}, {userName}!</CardTitle>
        <CardDescription className="text-primary-foreground/80">{dateFact}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3 p-3 bg-black/10 rounded-md">
          <Lightbulb className="h-5 w-5 mt-1 shrink-0" />
          <p className="text-sm italic">&quot;{quote}&quot;</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
            <Zap className="mr-2 h-4 w-4" />
            Quick Start a Task
          </Button>
          <Button variant="outline" className="border-primary-foreground/50 hover:bg-primary-foreground/10 text-primary-foreground">
            <CalendarCheck className="mr-2 h-4 w-4" />
            View My Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
