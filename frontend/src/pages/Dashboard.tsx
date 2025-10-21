import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';


function Dashboard() {
    const navigate = useNavigate();
    function logOut() {
        localStorage.setItem("user_data", JSON.stringify({}));
        window.location.reload();
    }
    return (
        <>
        <div>A possible Dashboard</div>
        <Button onClick={logOut}> Log Out</Button>
        </>
    )
}

export default Dashboard;