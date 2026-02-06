export interface jobsiteProps {
  id: number;
  name: string;
  created_at: string;
}

export class JobsiteModule {
  constructor(
    public id: number,
    public name: string,
    public created_at: string
  ) { }

  static adapt(response: any): jobsiteProps[] {
    console.log("JOBSDATAMODEL INPUT:", response);

    // Map the API data to jobsiteProps array
    const jobs: jobsiteProps[] = response?.map((j: any) => ({
      id: j.id,
      name: j.name,
      created_at: j.created_at,
    })) || [];

    return jobs; // return array directly, not { data: jobs }
  }
}