import React from 'react'
import './OrderDetail.css'
import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { useNavigate } from "react-router-dom"


const OrderDetail = () => {

    const navigate = useNavigate();

    const { url, token } = useContext(StoreContext)
    const [data, setData] = useState([]);

    const fetchOrders = async () => {
        const response = await axios.get(url + "/api/order/list", {}, { headers: { token } })
        setData(response.data.data)
        console.log(response.data.data);
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    const myorder = () => {
        navigate("/myorders")
    }


    return (
        <>
            <form className="place-order">
                <div className="place-order-right">
                    <div className="cart-total">
                        <h2>Order details</h2>
                        <br />
                        <p>{console.log(data)}</p>
                        {data.map((alldata, index) => {
                            if(data.length-1 == index)
                            return (
                                <div key={index}>
                            <p>{console.log(data.length-1, index)}</p>
                                <p>{console.log(alldata.userId)}</p>
                                    <div className="cart-total-details">
                                        <p>Order ID{console.log(alldata.order[alldata.order.length-1].id)}</p>
                                        <p className='order-id-box'>{alldata.order[alldata.order.length-1].id}</p>
                                        {/* <p className='order-id-box'>{alldata.order.map((item, index) => {
                                            if (index === alldata.items.length - 1) {
                                                return item._id;
                                            } else {
                                                return item._id;
                                            }
                                        })}</p> */}
                                    </div>
                                    <hr />
                                    <div className="cart-total-details">
                                        <p>Order Status</p>
                                        <p>{alldata.status}</p>
                                    </div>
                                    <hr />
                                    <br />
                                    <div className="cart-total-details">
                                        <h5>Items</h5>
                                        <h5>quantity</h5>
                                    </div>
                                    <br />
                                    <hr />
                                    {alldata.items.map((fruit, index) => (
                                        <div key={index}>
                                            <div className="cart-total-details">
                                                <p>{fruit.name}</p>
                                                <p>{fruit.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <hr />
                                </div>
                            )
                        
                        })}
                    </div>
                </div>
                <div className="place-order-right">
                    {data.map((item, index) => {
                            if(data.length-1 == index)
                            return (
                                <div className="cart-total" key={index}>
                                    <div    >
                                        <h2>Payment details</h2>
                                        <br />
                                        <div>
                                            <div className="cart-total-details">
                                                <p>Name</p>
                                                <p>{item.order[item.order.length-1].name}</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <p>Registered Email</p>
                                                <p>{item.order[item.order.length-1].email}</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <p>Amount</p>
                                                <p>{(item.order[item.order.length-1].amount_total) / 100}</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <p>Delivery Fee</p>
                                                <p>2</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <p>Mode of Payment</p>
                                                <p>{item.order[item.order.length-1].payment_mode}</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <p>Payment Status</p>
                                                <p>{item.order[item.order.length-1].status}</p>
                                            </div>
                                            <hr />
                                            <div className="cart-total-details">
                                                <b>Total</b>
                                                <b>{(item.order[item.order.length-1].amount_total) / 100 + 2}</b>
                                            </div>
                                    </div>
                                </div>
                                    <button onClick={() => myorder()}>MY ORDERS</button>
                                        </div>
                            );
                        
                    })}

                </div>

            </form>

        </>
    )
}

export default OrderDetail



// //<div className="cart-total-details">
// <p>Delivery Fee</p>
// {/* Render delivery fee */}
// {/* <p>{payment_details.deliveryFee}</p> */}
// </div>
// <hr />
// <div className="cart-total-details">
// <p>Payment Mode</p>
// {/* Render payment mode */}
// {/* <p>{payment_details.paymentMode}</p> */}
// </div>
// <hr />
// <div className="cart-total-details">
// <p>Payment Status</p>
// {/* Render payment status */}
// {/* <p>{payment_details.paymentStatus}</p> */}
// </div>
// <hr />
// <div className="cart-total-details">
// <p>Order Status</p>
// {/* Render order status */}
// {/* <p>{payment_details.orderStatus}</p> */}
// </div>
// <hr />
// <div className="cart-total-details">
// <b>Total</b>
// {/* Render total */}
// {/* <b>{payment_details.total}</b> */}
// </div>