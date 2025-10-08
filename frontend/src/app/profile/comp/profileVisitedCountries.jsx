const ProfileVisitedCountries = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
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
  )
}
export default ProfileVisitedCountries