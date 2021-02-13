import React ,{ useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core'
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import LineGraph from './LineGraph'
import { sortData } from './util'
import './App.css'
import 'leaflet/dist/leaflet.css'

function App() {

    const[countries, setCountries] = useState([]);
    const[country, setCountry] = useState('worldwide');     // Stores the country code selected only
    const[countryInfo, setCountryInfo] = useState({});      // Store the data we pull here
    const[tableData, setTableData] = useState([]);
    const[mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
    const[mapZoom, setMapZoom] = useState(3);
    const[mapCountries, setMapCountries] = useState([]);
 
    const countryChange = async (event) => {
        const countryCode = event.target.value;
        setCountry(countryCode);

        const url = 
            countryCode === 'worldwide' 
                ? "https://disease.sh/v3/covid-19/all" 
                : `https://disease.sh/v3/covid-19/countries/${countryCode}`

        await fetch(url)
            .then(response => response.json())
            .then(data => {
                setCountry(countryCode);        // Change it since we made a new request (meaning country code changed)
                setCountryInfo(data);
                // setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                setMapCenter({ lat: data.countryInfo.lat, lng: data.countryInfo.long });
                setMapZoom(5);
        })
    }

    console.log("Map center: ", mapCenter)

    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/all")
        .then((response => response.json()))
        .then((data) => {
            setCountryInfo(data);
        })
    }, []);

    useEffect(() => {
        const getCountriesData = async () => {
            fetch('https://disease.sh/v3/covid-19/countries')
            .then((response) => response.json())
            .then((data) => {
                const countries = data.map((country) => (
                    {
                        name : country.country,
                        value : country.countryInfo.iso2
                    }
                ));
                const sortedData = sortData(data)
                setTableData(sortedData);
                setCountries(countries);
                setMapCountries(data);
            })
        }
        getCountriesData();
    }, [])

    return (
        <div className='app'>

            <div className='app__left'>
                {/* Header */}
                <div className='app__header'>
                    <h1 className='app__header__title'>COVID-19 TRACKER</h1>
                    <FormControl className='app__header__dropdown'>
                        <Select variant='outlined' value={country} onChange={countryChange}>
                            <MenuItem value='worldwide'>Worldwide</MenuItem>
                            {
                                countries.map(country => (
                                    <MenuItem value={country.value}>{country.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </div>


                {/* InfoBoxes */}
                <div className='app__infoBoxes'>
                    <InfoBox 
                    title='Coronavirus cases' 
                    cases={countryInfo.todayCases} 
                    total={countryInfo.cases}
                    />

                    <InfoBox 
                    title='Recovered' 
                    cases={countryInfo.todayRecovered} 
                    total={countryInfo.recovered}
                    />

                    <InfoBox title='Deaths' 
                    cases={countryInfo.todayDeaths} 
                    total={countryInfo.deaths}
                    />
                </div>


                {/* Map */}
                <Map 
                countries={mapCountries}
                center={mapCenter} 
                zoom={mapZoom}
                />

            </div>
            
            
            <Card className='app__right'>
                <CardContent>
                    <div className='app__right__table'>
                        <h3>Live cases by country</h3>
                        <Table countries={tableData}/>
                        
                    </div>
                    <div className='app__right__graph'>
                        <h3>Worldwide new cases</h3>
                        <LineGraph />
                        
                    </div>
                </CardContent>
            </Card>

        </div>      
    )
}

export default App