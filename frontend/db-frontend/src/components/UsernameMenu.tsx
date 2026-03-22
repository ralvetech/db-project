import { CircleUserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const UsernameMenu = () => {
    const {user, logout} = useAuth0();
    return(
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-3 font-bold hover:text-red-500 gap-2">
                <CircleUserRound className="text-white"/>
                {user?.email}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Link to="user-profile" className="font-bold hover:text-yellow-500 hover:bg-gray-500">User Profile</Link>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem> 
                    <Button onClick={() => logout()} className="flex flex-1 font-bold bg-yellow-500">
                        <Link to="logout" className="font-bold hover:text-yellow-500">Logout</Link>
                    </Button>
                    </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export default UsernameMenu;