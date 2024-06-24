
import { useState } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios'
import './Add.css'
import { toast } from 'react-toastify'

const Add = ({url}) => {

  const [image, setImage] = useState(false)
  const [data, setData] = useState({
    name: '',
    discription: '',
    price: '',
    category: 'Salad'
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onSumbitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', data.name)
    formData.append('discription', data.discription)
    formData.append('price', Number(data.price))
    formData.append('category', data.category)
    formData.append('image', image)
    const response = await axios.post(`${url}/add`, formData)
    if (response.data.success) {
      setData({
        name: '',
        discription: '',
        price: '',
        category: ''
      })
      setImage(false)
      toast.success(response.data.message)
    }
    else {
      toast.error(response.data.message)
    }
  }
  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSumbitHandler}>
        <div className='add-img-upload flex-col'>
          <p>Upload Image</p>
          <label htmlFor='image'>
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt='' />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden required />
        </div>
        <div className='add-product-name flex-col'>
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type='text' name='name' placeholder='Type here' />
        </div>
        <div className='add-product-description flex-col'>
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.discription} name='discription' rows='6' placeholder='Write content here' />
        </div>
        <div className='add-category-price'>
          <div className='add-category flex-col'>
            <p>Product Category</p>
            <select onChange={onChangeHandler} value={data.category} name='category'>
              <option value='Dairy, Bread & Eggs'>Dairy, Bread & Eggs</option>
              <option value='Fruits'>Fruits</option>
              <option value='Vegetables'>Vegetables</option>
              <option value='Cold Drinks & Juices'>Cold Drinks & Juices</option>
              <option value='Breakfast & Instant Food'>Breakfast & Instant Food</option>
              <option value='Ice creams'>Ice creams</option>
              <option value='Chocolates'>Chocolates</option>
              <option value='Personal Care'>Personal Care</option>
              <option value='Atta, Rice & Dal'>Atta, Rice & Dal</option>
              <option value='Home & Office'>Home & Office</option>
              <option value='Pharma & Wellness'>Pharma & Wellness</option>
            </select>
          </div>
          <div className='add-price flex-col'>
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type='number' name='price' placeholder='$20' />
          </div>
        </div>

        <button type='submit' className='add-btn'>Add</button>
      </form>
    </div>
  )
}

export default Add