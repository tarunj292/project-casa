import react, { useEffect, useState } from "react"
import { useBrand } from '../contexts/BrandContext'
import axios from 'axios'

const Order = () => {
    const { brand } = useBrand()
    const [sales, setSales] = useState([{}])

    useEffect(() => {
        const fetchSales = async () => {
            const salesData = await axios.get(`http://localhost:5002/api/brands/sales/${brand}`)
            setSales(salesData.data)
        }
        fetchSales()
    }, [])

    return (
        <>I am {brand?.name}</>
    )
}

export default Order;