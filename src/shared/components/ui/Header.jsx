import React from 'react'

const Header = ({ title, description }) => {
    return (
        <div className="mb-6">
            <h1 className="text-2xl mb-1">{title}</h1>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>

    )
}

export default Header