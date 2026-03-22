import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type CreateUserRequest = {
    auth0_id: string;
    email: string;
};

export const useCreateMyUser = () => {
    const createMyUserRequest = async (user: CreateUserRequest) => {
        console.log("sending user data", user);
        const response = await fetch(`${API_BASE_URL}/api/my/user`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if(!response.ok){
            throw new Error("Failed to create user");
        }
    };

    const { mutateAsync: createUser, isPending, isError, isSuccess} = useMutation({ mutationFn: createMyUserRequest });
    
    return { createUser, isPending, isError, isSuccess };
};

type UpdateMyUserRequest = {
    username: string,
    district: string,
    city: string
};

export const useUpdateMyUser = () => {
    const updateMyUserRequest = async (FormData: UpdateMyUserRequest) => {
        const response = await fetch(`${API_BASE_URL}/api/my/user`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(FormData),
        }); 

        if(!response.ok){
            throw new Error("Failed to update user");
        }

        return response.json();
};
        const { mutateAsync: updateCurrentUser, isPending, isError, isSuccess, reset} = useMutation({ mutationFn: updateMyUserRequest });
    if(isSuccess){
        toast.success("User profile updated successfully");
    }
    
    if(isError){
        toast.error(isError.toString())
        reset()
    }
    return { updateCurrentUser, isPending, isError, isSuccess };
};