import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import LoadingButton from '@/components/LoadingButton';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

const formSchema = z.object({
    email: z.string().optional(),
    username :z.string().min(1, "Username is required"),
    district :z.string().min(1, "District is required"),
    city :z.string().min(1, "City is required"),
});


export type UserFormData = z.infer<typeof formSchema>;

type Props = {
    currentUser?: UserFormData
    onSave: (userProfileData: UserFormData) => void;
    onDelete: () => void;
    isPending: boolean;
    isDeleting: boolean;

};

const UserProfileForm =  ({onSave, isPending, onDelete, isDeleting, currentUser}: Props) => {
    const { user } = useAuth0();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: currentUser ?? { email: user?.email },
    });
    useEffect(() => {
        if (currentUser) reset(currentUser)
        }, [currentUser, reset])

    return(
            <form onSubmit={handleSubmit(onSave)} className='space-y-4 bg-gray-50 rounder-lg md:p-10'>
                <div>
                    <h2 className="text-2xl font-bold">User Profile Form</h2>
                    <p className='text-sm text-gray-500'>View and update your profile information here</p>
                </div>
                <div className="space-y-2 flex-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...register("email")} className="bg-white" disabled/>
                </div>
                <div className="space-y-2 flex-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...register("username")} />
                    {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2 flex-1">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" {...register("district")} />
                    {errors.district && <p className="text-red-500">{errors.district.message}</p>}
                </div>
                <div className="space-y-2 flex-1">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-red-500">{errors.city.message}</p>}
                </div>

                <div className="flex gap-3">
                    {isPending ? (
                        <LoadingButton />
                    ) : (
                        <Button type="submit" className="bg-yellow-500">
                            Save Changes
                        </Button>
                    )}
                    {isDeleting ? (
                        <LoadingButton />
                    ) : (
                        <Button
                            type="button"
                            onClick={onDelete}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete Profile
                        </Button>
                        )}
                    </div>
            </form>
    )
};


export default UserProfileForm;