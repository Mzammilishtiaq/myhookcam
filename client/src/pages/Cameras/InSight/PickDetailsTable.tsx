import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Play, Share2, Star } from 'lucide-react';
import React, { useState } from 'react'

interface PickEvent {
    id: string;
    pickNumber: number;
    timeStart: string;
    timeEnd: string;
    durationMinutes: number;
    tonnage: number;
    hour: number;
    thumbnailUrl: string;
    videoUrl: string;
    locationX: number;
    locationY: number;
}
function PickDetailsTable() {
    const pickEvents: PickEvent[] = [
        { id: "PK-7A3F2B", pickNumber: 1, timeStart: "6:30 AM", timeEnd: "6:38 AM", durationMinutes: 8, tonnage: 3.2, hour: 6.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-7a3f2b", locationX: 25, locationY: 30 },
        { id: "PK-9D4E1C", pickNumber: 2, timeStart: "7:15 AM", timeEnd: "7:20 AM", durationMinutes: 5, tonnage: 2.1, hour: 7.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9d4e1c", locationX: 45, locationY: 20 },
        { id: "PK-2B5F8A", pickNumber: 3, timeStart: "8:00 AM", timeEnd: "8:12 AM", durationMinutes: 12, tonnage: 5.8, hour: 8.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2b5f8a", locationX: 65, locationY: 45 },
        { id: "PK-6C1D3E", pickNumber: 4, timeStart: "8:45 AM", timeEnd: "8:51 AM", durationMinutes: 6, tonnage: 2.5, hour: 8.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6c1d3e", locationX: 35, locationY: 60 },
        { id: "PK-8E2G4H", pickNumber: 5, timeStart: "9:30 AM", timeEnd: "9:40 AM", durationMinutes: 10, tonnage: 4.2, hour: 9.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8e2g4h", locationX: 55, locationY: 35 },
        { id: "PK-1A9B7C", pickNumber: 6, timeStart: "10:15 AM", timeEnd: "10:19 AM", durationMinutes: 4, tonnage: 1.8, hour: 10.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1a9b7c", locationX: 75, locationY: 25 },
        { id: "PK-3D5F2E", pickNumber: 7, timeStart: "11:00 AM", timeEnd: "11:07 AM", durationMinutes: 7, tonnage: 3.5, hour: 11.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3d5f2e", locationX: 20, locationY: 55 },
        { id: "PK-5G7H9I", pickNumber: 8, timeStart: "11:30 AM", timeEnd: "11:39 AM", durationMinutes: 9, tonnage: 4.0, hour: 11.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-5g7h9i", locationX: 50, locationY: 70 },
        { id: "PK-2J4K6L", pickNumber: 9, timeStart: "1:00 PM", timeEnd: "1:11 PM", durationMinutes: 11, tonnage: 5.2, hour: 13.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-2j4k6l", locationX: 40, locationY: 40 },
        { id: "PK-8M1N3O", pickNumber: 10, timeStart: "1:45 PM", timeEnd: "1:51 PM", durationMinutes: 6, tonnage: 2.8, hour: 13.75, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-8m1n3o", locationX: 60, locationY: 55 },
        { id: "PK-4P6Q8R", pickNumber: 11, timeStart: "2:30 PM", timeEnd: "2:38 PM", durationMinutes: 8, tonnage: 3.6, hour: 14.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-4p6q8r", locationX: 30, locationY: 75 },
        { id: "PK-9S2T4U", pickNumber: 12, timeStart: "3:15 PM", timeEnd: "3:20 PM", durationMinutes: 5, tonnage: 2.2, hour: 15.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-9s2t4u", locationX: 70, locationY: 65 },
        { id: "PK-1V3W5X", pickNumber: 13, timeStart: "4:00 PM", timeEnd: "4:10 PM", durationMinutes: 10, tonnage: 4.5, hour: 16.0, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-1v3w5x", locationX: 45, locationY: 50 },
        { id: "PK-6Y8Z2A", pickNumber: 14, timeStart: "4:30 PM", timeEnd: "4:37 PM", durationMinutes: 7, tonnage: 3.1, hour: 16.5, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-6y8z2a", locationX: 80, locationY: 40 },
        { id: "PK-3B5C7D", pickNumber: 15, timeStart: "5:15 PM", timeEnd: "5:19 PM", durationMinutes: 4, tonnage: 1.9, hour: 17.25, thumbnailUrl: "/api/placeholder/120/68", videoUrl: "https://hookcam.com/clips/pk-3b5c7d", locationX: 15, locationY: 80 },
    ];
    const getWindSpeedForPick = (hour: number) => {
        const windEntry = windData.find(w => Math.floor(hour) === w.hour);
        return windEntry?.windSpeed || 0;
    };
    const windData = [
        { hour: 0, windSpeed: 8 },
        { hour: 1, windSpeed: 7 },
        { hour: 2, windSpeed: 6 },
        { hour: 3, windSpeed: 5 },
        { hour: 4, windSpeed: 6 },
        { hour: 5, windSpeed: 8 },
        { hour: 6, windSpeed: 10 },
        { hour: 7, windSpeed: 12 },
        { hour: 8, windSpeed: 14 },
        { hour: 9, windSpeed: 16 },
        { hour: 10, windSpeed: 18 },
        { hour: 11, windSpeed: 20 },
        { hour: 12, windSpeed: 22 },
        { hour: 13, windSpeed: 21 },
        { hour: 14, windSpeed: 19 },
        { hour: 15, windSpeed: 17 },
        { hour: 16, windSpeed: 15 },
        { hour: 17, windSpeed: 13 },
        { hour: 18, windSpeed: 11 },
        { hour: 19, windSpeed: 10 },
        { hour: 20, windSpeed: 9 },
        { hour: 21, windSpeed: 8 },
        { hour: 22, windSpeed: 7 },
        { hour: 23, windSpeed: 7 },
        { hour: 24, windSpeed: 8 },
    ];
    const updateNote = (pickId: string, note: string) => {
        setNotes(prev => ({ ...prev, [pickId]: note }));
    };
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [starredPicks, setStarredPicks] = useState<Set<string>>(new Set());
    const [selectedPickForShare, setSelectedPickForShare] = useState<PickEvent | null>(null);
    const [shareEmails, setShareEmails] = useState("");
    const [shareMessage, setShareMessage] = useState("");
    const [shareModalOpen, setShareModalOpen] = useState(false);

    const toggleStar = (pickId: string) => {
        setStarredPicks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pickId)) {
                newSet.delete(pickId);
            } else {
                newSet.add(pickId);
            }
            return newSet;
        });
    };
    const handleShare = (pick: PickEvent) => {
        setSelectedPickForShare(pick);
        setShareEmails("");
        setShareMessage("");
        setShareModalOpen(true);
    };
    return (
        <Card className="border-[#BCBBBB]">
            <CardHeader>
                <CardTitle className="text-[#555555] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#FBBC05]" />
                    Pick Details Table
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#555555]">
                                <TableHead className="text-white font-medium">Pick ID</TableHead>
                                <TableHead className="text-white font-medium text-center">Pick #</TableHead>
                                <TableHead className="text-white font-medium">Thumbnail</TableHead>
                                <TableHead className="text-white font-medium">Start</TableHead>
                                <TableHead className="text-white font-medium">End</TableHead>
                                <TableHead className="text-white font-medium">Duration</TableHead>
                                <TableHead className="text-white font-medium">Wind (mph)</TableHead>
                                <TableHead className="text-white font-medium">Notes</TableHead>
                                <TableHead className="text-white font-medium text-center">Star</TableHead>
                                <TableHead className="text-white font-medium text-center">Share</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pickEvents.map((pick) => (
                                <TableRow key={pick.id} className="hover:bg-gray-50" data-testid={`pick-row-${pick.id}`}>
                                    <TableCell className="font-mono text-sm text-[#555555]">{pick.id}</TableCell>
                                    <TableCell className="text-center text-[#555555]">{pick.pickNumber}</TableCell>
                                    <TableCell>
                                        <div className="relative w-[120px] h-[68px] bg-[#555555] rounded overflow-hidden cursor-pointer group">
                                            <img
                                                src={`https://picsum.photos/seed/${pick.id}/120/68`}
                                                alt={`Pick ${pick.id} thumbnail`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                <Play className="h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">
                                                {pick.durationMinutes}m
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[#555555]">{pick.timeStart}</TableCell>
                                    <TableCell className="text-[#555555]">{pick.timeEnd}</TableCell>
                                    <TableCell className="text-[#555555]">{pick.durationMinutes} min</TableCell>
                                    <TableCell className="text-[#555555]">{getWindSpeedForPick(pick.hour)}</TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Add note..."
                                            value={notes[pick.id] || ""}
                                            onChange={(e) => updateNote(pick.id, e.target.value)}
                                            className="w-[150px] text-sm border-[#BCBBBB]"
                                            data-testid={`note-input-${pick.id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStar(pick.id)}
                                            data-testid={`star-btn-${pick.id}`}
                                        >
                                            <Star
                                                className={`h-5 w-5 ${starredPicks.has(pick.id) ? 'fill-[#FBBC05] text-[#FBBC05]' : 'text-[#BCBBBB]'}`}
                                            />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShare(pick)}
                                            data-testid={`share-btn-${pick.id}`}
                                        >
                                            <Share2 className="h-5 w-5 text-[#555555] hover:text-[#FBBC05]" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export default PickDetailsTable