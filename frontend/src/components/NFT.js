import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ethers } from 'ethers';

function NFT({item}) {
  return <Card>
    <CardMedia
      component="img"
      height="140"
      image={item.image}
      alt={item.title}
      sx={{objectFit: 'contain'}}
    />
    <CardContent>
      <Typography gutterBottom variant="h5" component="div">
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" component='p'>
        Description: {item.description}
      </Typography>
      <Typography variant="body2" color="text.secondary" component='p'>
        Price: {ethers.utils.formatEther(item.price)}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">View</Button>
    </CardActions>
  </Card>;
}

export default NFT;