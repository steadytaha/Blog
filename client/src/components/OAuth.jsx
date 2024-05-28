import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider , signInWithPopup, getAuth} from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import app from '../firebase';

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider)
            const res = await fetch('/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    photo: resultsFromGoogle.user.photoURL 
                })
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(signInSuccess(data));
                navigate('/');
            }
        } catch (error) {
            console.error(error.message);
        }
    }
 return (
    <Button type='button' gradientDuoTone='pinkToOrange' outline onClick={handleGoogle} disabled>
        <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
            Continue with Google
    </Button>
  )
};
