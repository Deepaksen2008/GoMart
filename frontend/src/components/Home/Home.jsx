import { useState } from 'react'
import './Home.css'
import Header from '../Header/Header'
import ExploreMenu from '../ExploreMenu/ExploreMenu'
import FoodDisply from '../FoodDisplay/FoodDisply'
import Appdownload from '../AppDownload/Appdownload'

const Home = () => {

    const [category, setCategory] = useState("All");
    
    return (
        <div>
            <Header />
            <ExploreMenu category={category} setCategory={setCategory} />
            <FoodDisply category={category}/>
            <Appdownload/>
        </div>
    )
}

export default Home