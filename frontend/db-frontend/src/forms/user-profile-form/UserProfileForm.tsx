import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import LoadingButton from '@/components/LoadingButton';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';

const formSchema = z.object({
    email: z.string().optional(),
    username :z.string().min(1, "Username is required"),
    district :z.string().min(1, "District is required"),
    city :z.string().min(1, "City is required"),
});


export type UserFormData = z.infer<typeof formSchema>;

type Props = {
    onSave: (userProfileData: UserFormData) => void;
    isPending: boolean;
};

const UserProfileForm =  ({onSave, isPending}: Props) => {
    const { user } = useAuth0();
    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: user?.email ? { email: user.email } : undefined,
    });

    return(
            <form onSubmit={handleSubmit(onSave)} className='space-y-4 bg-gray-50 rounder-lg md:p-10'>
                <div>
                    <h2 className="text-2xl font-bold">User Profile Form</h2>
                    <p className='text-sm text-gray-500'>View and update your profile information here</p>
                </div>
                <div className="space-y-2 flex-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...register("email")} className="bg-white" />
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

                {isPending ? <LoadingButton /> : <Button type="submit" className='bg-yellow-500'>Save Changes</Button>}
            </form>
    )
};


export default UserProfileForm;