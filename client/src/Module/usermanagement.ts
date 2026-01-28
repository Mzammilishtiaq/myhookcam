export interface UserManagementProps {
    id: string
    email: string
    full_name: string
    first_name: string
    last_name: string
    phone_no: string
    person_id:string
    person_type: string
    groupId: string | null
    logo: string | null
    recording: boolean
    recording_limit: number
    zoomControl: boolean
    created_at: string
    created_time: string
}


export class UserManagementModule {
    constructor(
        public id: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public full_name: string,
        public phone_no: string,
        public person_id:string,
        public person_type: string,
        public groupId: string | null,
        public logo: string,
        public recording: boolean,
        public recording_limit: string,
        public zoomControl: boolean,
        public created_at: string,
        public created_time: string
    ) { }

    static adapt(response: any): { users: UserManagementProps[]; users_count: number } {
        console.log("DATAMODEL INPUT:", response)

        const users = Array.isArray(response?.users) ? response.users : []
        const [...mappedUsers] = users.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            first_name: u.first_name,
            last_name: u.last_name,
            phone_no: u.phone_no,
            person_id: u.person_id,
            person_type: u.person_type,
            groupId: u.group_id,
            logo: u.logo,
            recording: u.recording === "1",
            recording_limit: Number(u.recording_limit || 0),
            zoomControl: u.zoom_control === "1",
            created_at: u.created_at,
            created_time: u.created_time
        }))

        return {
            users: [...mappedUsers],
            users_count: users.length
        }
    }
}
