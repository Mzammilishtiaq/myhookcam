export interface UserManagementProps {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    created_at: string
    last_login: string
    is_active?: boolean
}


export class UserManagementModule {
    constructor(
        public id: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public created_at: string,
        public last_login: string,
        public is_active?: boolean
    ) { }

    static adapt(response: any): { data: UserManagementProps[]; } {
        console.log("DATAMODEL INPUT:", response);

        return response?.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            first_name: u.first_name,
            last_name: u.last_name,
            role: u.role,
            created_at: u.created_at,
            last_login: u.last_login,
            is_active: u.is_active,
        }))
    }
}
