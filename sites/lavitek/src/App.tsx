import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'

import Home from './pages/Home'
import CatalogIndex from './pages/CatalogIndex'
import CatalogDirection from './pages/CatalogDirection'
import CatalogItem from './pages/CatalogItem'
import ByDrawing from './pages/ByDrawing'
import Alloys from './pages/Alloys'
import Tolerances from './pages/Tolerances'
import Standards from './pages/Standards'
import Services from './pages/Services'
import Industries from './pages/Industries'
import Delivery from './pages/Delivery'
import HowWeWork from './pages/HowWeWork'
import About from './pages/About'
import Contacts from './pages/Contacts'
import Legal from './pages/Legal'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<CatalogIndex />} />
        <Route path="/catalog/:dir" element={<CatalogDirection />} />
        <Route path="/catalog/:dir/:item" element={<CatalogItem />} />
        <Route path="/po-chertezhu" element={<ByDrawing />} />
        <Route path="/splavy" element={<Alloys />} />
        <Route path="/dopuski" element={<Tolerances />} />
        <Route path="/ntd" element={<Standards />} />
        <Route path="/uslugi" element={<Services />} />
        <Route path="/otrasli" element={<Industries />} />
        <Route path="/dostavka-i-oplata" element={<Delivery />} />
        <Route path="/preimushchestva" element={<HowWeWork />} />
        <Route path="/o-nas" element={<About />} />
        <Route path="/kontakty" element={<Contacts />} />
        <Route path="/pravovaya-informaciya" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
