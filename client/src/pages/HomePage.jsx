import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => {
                navigate("/view")
            }}>View Leads</button>
            <button onClick={() => {
                navigate("/create")
            }}>Create New Lead</button>
            <button onClick={() => {
                navigate("/update")
            }}>Update New Lead</button>
        </div>
    )
}

export default HomePage;