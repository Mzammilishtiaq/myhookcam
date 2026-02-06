export interface Member {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: "manager" | "viewer";
    is_owner: boolean;
    can_view_recordings: boolean;
    can_ptz: boolean;
    recording_limit_days: number | null;
    invited_by: number;
}

export interface Permissions {
    can_ptz: boolean;
    can_view_recordings: boolean;
    recording_limit_days: number | null;
}

export interface Invited {
    id: number;
    email: string;
    role: "manager" | "viewer";
    permissions: Permissions | null;
    invited_by: number;
    expires_at: string;
    created_at: string;
}

export interface MembersData {
    members: Member[];
    invited: Invited[];
}

export interface InviteUserJobsiteModuleProps {
    status: "success" | "error";
    data: MembersData;
}

export class InviteUserJobsiteModule {
    constructor(
        public id: number,
        public email: string,
        public role: "manager" | "viewer",
        public permissions: Permissions | null,
        public invited_by: number,
        public expires_at: string,
        public created_at: string
    ) { }

    static adapt(response: any): MembersData {
        console.log("INVITEUSERJOBCITEDATAMODEL INPUT:", response);

        const members: Member[] = response?.members?.map((m: any) => ({
            id: m.id,
            email: m.email,
            first_name: m.first_name,
            last_name: m.last_name,
            role: m.role,
            is_owner: m.is_owner,
            can_view_recordings: m.can_view_recordings,
            can_ptz: m.can_ptz,
            recording_limit_days: m.recording_limit_days,
            invited_by: m.invited_by,
        })) || [];

        const invited: Invited[] = response?.invited?.map((i: any) => ({
            id: i.id,
            email: i.email,
            role: i.role,
            permissions: i.permissions ? {
                can_ptz: i.permissions.can_ptz,
                can_view_recordings: i.permissions.can_view_recordings,
                recording_limit_days: i.permissions.recording_limit_days,
            } : null,
            invited_by: i.invited_by,
            expires_at: i.expires_at,
            created_at: i.created_at,
        })) || [];

        return { members, invited };
    }
}