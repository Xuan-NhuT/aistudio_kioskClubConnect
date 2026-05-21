export interface Student {
  netId: string;
  name: string;
  avatar: string;
  email: string;
  interests: string[];
  classes: string[];
  bio: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  logo: string;
  memberCount: number;
  members: string[]; // List of student NetIDs
  meetingTime: string;
  meetingLocation: string;
}

export interface CheckIn {
  id: string;
  netId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  clubName: string;
  locationId: string; // building ID
  timeFrom: string; // e.g. "18:15"
  stayDuration: string; // e.g., "1 hour", "3 hours"
  note: string;
  checkedInAt: Date;
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortName: string;
  x: number; // percentage coordinate on vector map
  y: number; // percentage coordinate on vector map
  description: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  time: string;
  locationId: string; // building ID
  clubId: string; // host club
  attendees: string[]; // list of NetIDs
  coverImage: string;
  tag: string;
}
