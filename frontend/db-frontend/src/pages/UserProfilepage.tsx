import { useDeleteMyUser, useGetMyUser, useUpdateMyUser } from "@/api/MyUserApi";
import UserProfileForm from "@/forms/user-profile-form/UserProfileForm"

const UserProfilePage = () => {
    const { currentUser, isPending: isFetching } = useGetMyUser()
    const { updateCurrentUser, isPending: isUpdatePending } = useUpdateMyUser();
    const { deleteCurrentUser, isPending: isDeleting } = useDeleteMyUser();
    
    return(
        <UserProfileForm onSave={updateCurrentUser} isPending={isUpdatePending} onDelete={deleteCurrentUser}  currentUser={currentUser} isDeleting={isDeleting}/>
    )
}


export default UserProfilePage;