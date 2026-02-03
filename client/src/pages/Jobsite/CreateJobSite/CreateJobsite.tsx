import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { backendCall } from "@/Utlis/BackendService";

type FormData = {
    name: string;
    address: string;
};

export default function CreateJobsite() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    // Mutation to create jobsite
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: FormData) => {
            return backendCall({
                url: "/jobsites",
                method: "POST",
                data,
            });
        },
        onSuccess: () => {
            toast({
                title: "Jobsite Created",
                description: "The jobsite has been successfully created",
            });
            queryClient.invalidateQueries({ queryKey: ["jobsites"] }); // refresh jobsite list
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error?.message || "Failed to create jobsite",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: FormData) => {
        mutate(data);
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-140px)] py-6 px-4 bg-gray-50/50">
            <div className="bg-white p-8 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-10">
                    <div>
                        <h1 className="flex items-center gap-3 text-4xl font-bold text-[#555555]">
                            <MapPin className="h-10 w-10 text-[#FBBC05]" />
                            Create Jobsite
                        </h1>
                        <p className="mt-2 text-xl text-gray-500">Create a new jobsite and manage site</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-x-10 gap-y-4 lg:space-y-0">
                    <div className="space-y-4 w-full">
                        <Label className="text-xl font-bold text-[#555555]">Jobsite Name</Label>
                        <Input
                            placeholder="Enter a Jobsite Name"
                            className="h-16 text-xl max-w-2xl rounded-none border-[#BCBBBB]"
                            {...register("name", { required: "Jobsite name is required" })}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-4 w-full">
                        <Label className="text-xl font-bold text-[#555555]">Jobsite Address</Label>
                        <Input
                            placeholder="Enter a Jobsite Address"
                            className="h-16 text-xl max-w-2xl rounded-none border-[#BCBBBB]"
                            {...register("address", { required: "Jobsite address is required" })}
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            className="h-16 px-10 text-xl bg-[#FBBC05] hover:bg-[#e5a900] rounded-none"
                            disabled={isPending}
                        >
                            {isPending ? "Creating..." : "Create New Jobsite"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}