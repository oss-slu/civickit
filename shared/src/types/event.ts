// shared/src/types/event.ts
import { EventStatus, RsvpStatus } from "../enums/event";
import { Issue } from "./issue";
import { User } from "./user";

export interface Event {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: EventStatus;
    latitude: number;
    longitude: number;
    address: string;
    createdAt: string;
    issue: Pick<Issue, 'id' | 'title'>;
    organizaer: Pick<User, 'id' | 'name' | 'profileImage'>;
    rsvpCount: number
}

export interface EventRsvp {
    id: string
    user: Pick<User, 'id' | 'name' | 'profileImage'>
    event: Pick<Event, 'id' | 'title'>
    status: RsvpStatus
    createdAt: string
}