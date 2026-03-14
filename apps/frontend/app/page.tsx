import Footer from "@/components/Footer"
import HighLightCards from "@/components/LandingPage/HighLightCards"
import HomeCarousel from "@/components/LandingPage/HomeCarousel"
import MarketList from "@/components/LandingPage/MarketList"
import { Market } from "@/types"
import { getCurrentData } from "@/utils/http"
import axios from "axios"

const HomePage = async () => {


  const data = await getCurrentData()
  return (
    <div className="bg-base-background-l0 text-high-emphasis flex flex-1 flex-col justify-between overflow-y-auto">
      <div className="flex flex-col flex-1 gap-8 ">
        <div className="flex flex-col mx-auto w-full max-w-7xl flex-1 gap-4  px-3 sm:px-6">
          <HomeCarousel />
          <HighLightCards data={data} />
          <MarketList data={data} />
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default HomePage
