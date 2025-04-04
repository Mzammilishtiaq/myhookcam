import { useState } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LiveStream from "@/pages/LiveStream";
import Recordings from "@/pages/Recordings";
import SystemStatus from "@/pages/SystemStatus";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MainNavigation() {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="bg-[#555555] text-[#FFFFFF] px-4 pt-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">
            <span className="text-[#FBBC05]">Hook</span>Cam System
          </h1>
        </div>
        
        <Tabs value={location === "/" ? "/livestream" : location} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger 
              value="/livestream" 
              className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
              onClick={() => setLocation("/livestream")}
            >
              Live Stream
            </TabsTrigger>
            <TabsTrigger 
              value="/recordings" 
              className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
              onClick={() => setLocation("/recordings")}
            >
              Recordings
            </TabsTrigger>
            <TabsTrigger 
              value="/system-status" 
              className="flex-1 data-[state=active]:text-[#FBBC05] data-[state=active]:border-b-2 data-[state=active]:border-[#FBBC05]"
              onClick={() => setLocation("/system-status")}
            >
              System Status
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <MainNavigation />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={LiveStream} />
          <Route path="/livestream" component={LiveStream} />
          <Route path="/recordings" component={Recordings} />
          <Route path="/system-status" component={SystemStatus} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="bg-[#BCBBBB] text-[#555555] p-3 text-sm text-center">
        <div className="container mx-auto">
          <p><span className="font-semibold">HookCam System v1.0</span> | Connected to AWS S3 Storage</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
