import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled, lighten, darken } from '@mui/system';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#E3D026',
            light: '#E9DB5D',
            dark: '#A29415'
        }
    },
});



const GroupHeader = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    color: theme.palette.primary.main,
    backgroundColor:
        theme.palette.mode === 'light'
            ? lighten(theme.palette.primary.light, 0.85)
            : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
    padding: 0,
});

export default function RenderGroup2({ countriesData, country, setCountry}) {
    const options = countriesData?countriesData.map((option) => {
        const firstLetter = option[0].toUpperCase();
        return {
            firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
            label: option
        };
    }) : [];


    return (
        <Autocomplete
            loading={ countriesData.length?false:true}
            disabled={country.country?.label ? false : true}
            value={country.city.label?country.city:null}
            onChange={(event, newValue) => {
                setCountry({ ...country, city: newValue });
            }}
            className='mb-4 !w-full'
            id="grouped-demo"
            options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
            groupBy={(option) => option.firstLetter}
            getOptionLabel={(option) => option.label}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="City" />}
            renderGroup={(params) => (
                <li key={params.key}>
                    <GroupHeader theme={theme}>{params.group}</GroupHeader>
                    <GroupItems>{params.children}</GroupItems>
                </li>
            )}
        />
    );
}
