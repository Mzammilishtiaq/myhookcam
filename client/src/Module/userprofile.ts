export interface UserProfileProps {
    id: string,
    email: string,
    first_name: string,
    last_name: string,
    last_login: string,
    created_at: string
}

export class UserProfileModule {
    constructor(
        public id: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public last_login: string,
        public created_at: string
    ) { }

    static adapt(response: any): UserProfileProps {
        console.log("USER PROFILE DATAMODEL INPUT:", response)

        return {
            id: response.id,
            email: response.email,
            first_name: response.first_name,
            last_name: response.last_name,
            last_login: response.last_login,
            created_at: response.created_at
        }
    }
}