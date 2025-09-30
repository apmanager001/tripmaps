import React from 'react'
import { useVisitedCountries } from '@/components/visitedCountrys'

const ProfileVisitedCountries = ({ userId }) => {
  const { data, isLoading, error } = useVisitedCountries(userId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading visited countries</div>

  return (
    <div>
        {data && data.length > 0 ? (
          <ul className='flex flex-wrap gap-2 rounded-sm'>
            {data.map((country, index) => (
                <div 
                    className='tooltip ' 
                    data-tip={country.name} 
                    key={index}
                >
                    <img
                    src={country.flagUrl}
                    alt={country.name}
                    className='w-12 h-12 object-cover rounded-sm border border-base-content'
                    />
              </div>
            ))}
          </ul>
        ) : (
          <div>No visited countries found</div>
        )}
    </div>
  )
}
export default ProfileVisitedCountries