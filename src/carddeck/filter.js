import React from 'react';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import png_world from './images/world.png';
import png_diamond from './images/diamond.png';
import Select from 'react-select';
import SelectSearch from 'react-select';



export function Filter({channels,onClick}) {
    return(
        <Grid container 
            spacing={16}
            justify="center"
            alignItems="center"
        >
            <Grid item>
                <img src={png_world} alt="World" height="40px"/>
            </Grid>
            <Grid item>
                <Chip
                    label="All continents"
                    onClick={()=>onClick("all")}
                    variant="outlined"
                />
            </Grid>
            { channels.map((chan,index) => (
                <Grid item key={index}>
                    <Chip key={index} 
                        label={chan} 
                        variant="outlined" 
                        onClick={()=>onClick(chan)}
                    />         
                </Grid>  
            ))}
        </Grid>
    )
}

export function RarityFilter({rarity,onClick}) {
    return(
        <Grid container 
            spacing={16}
            justify="center"
            alignItems="center"
        >
            <Grid item>
            <img src={png_diamond} alt="diamond" height="40px"/>
            </Grid>
            <Grid item>
                <Chip
                    label="All rarities"
                    onClick={()=>onClick("all")}
                    variant="outlined"
                />
            </Grid>
            { rarity.map((rare,index) => (
                <Grid item key={index}>
                    <Chip key={index} 
                        label={rare} 
                        variant="outlined" 
                        onClick={()=>onClick(rare)}
                    />         
                </Grid>  
            ))}
        </Grid>
    )
}

