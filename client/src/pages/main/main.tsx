import styles from './main.module.scss';
import Map from '../../map'
import Navbar from '../../components/navbar';


const Main = () => {

    return (
        <div className={styles.main}>
            <div className={styles.map} id='map'>
                <Map />
            </div>
            <div className={styles.navbar}> <Navbar /> </div>
        </div>
    )
};

export default Main;