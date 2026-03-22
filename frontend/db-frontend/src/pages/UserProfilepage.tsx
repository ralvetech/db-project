import { useUpdateMyUser } from "@/api/MyUserApi";
import UserProfileForm from "@/forms/user-profile-form/UserProfileForm"

const UserProfilePage = () => {
    const { updateCurrentUser, isPending: isUpdatePending } = useUpdateMyUser();
    return(
        <UserProfileForm onSave={updateCurrentUser} isPending={isUpdatePending}/>
    )
}


export default UserProfilePage;