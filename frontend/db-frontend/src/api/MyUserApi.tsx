import type { UserFormData } from "@/forms/user-profile-form/UserProfileForm";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type CreateUserRequest = {
    auth0_id: string;
    email: string;
};

export const useCreateMyUser = () => {
    const createMyUserRequest = async (user: CreateUserRequest) => {
    const checkResponse = await fetch(
      `${API_BASE_URL}/api/my/user?auth0_id=${user.auth0_id}`
    );

    if (checkResponse.ok) {
      // User exists → do nothing
      console.log("User already exists, skipping creation");
      return;
    }

    if (checkResponse.status !== 404) {
      // Some real error
      throw new Error("Failed to check existing user");
    }
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
  const queryClient = useQueryClient();
  const { user } = useAuth0();

  const updateMyUserRequest = async (formData: UpdateMyUserRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/my/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth0_id: user?.sub,
        ...formData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update user: ${response.status} ${errorText}`);
    }

    return response.json();
  };

  const {
    mutateAsync: updateCurrentUser,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: updateMyUserRequest,
    onSuccess: () => {
      toast.success("User profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchCurrentUser", user?.sub] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  return {
    updateCurrentUser,
    isPending,
    isError,
    isSuccess,
    error,
  };
};

export const useDeleteMyUser = () => {
    const { user } = useAuth0();

    const deleteMyUserRequest = async () => {
        const response = await fetch(`${API_BASE_URL}/api/my/user`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ auth0_id: user?.sub }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        return response.json();
    };

    const { mutateAsync: deleteCurrentUser, isPending, isError, isSuccess, reset } = useMutation({
        mutationFn: deleteMyUserRequest,
    });

    if (isSuccess) {
        toast.success("We're sad to see you leave :)");
    }

    if (isError) {
        toast.error("Failed to delete account");
        reset();
    }

    return { deleteCurrentUser, isPending, isError, isSuccess };
};

export const useGetMyUser = () => {
  const { user } = useAuth0();

  console.log("auth0 User, ", user)

  const getMyUserRequest = async (): Promise<UserFormData> => {
    const response = await fetch(`${API_BASE_URL}/api/my/user?auth0_id=${user?.sub}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },

    })

    if (!response.ok) {
      throw new Error("Failed to get user")
    }
    const data = await response.json()
    console.log("API RESPOSE: ", data)
    return data;
  }

  const { data: currentUser, isPending, isError } = useQuery({
    queryKey: ["fetchCurrentUser"],
    queryFn: getMyUserRequest,
    enabled: !!user?.sub,
  })
  console.log("current User", currentUser)
  return { currentUser, isPending, isError }
}