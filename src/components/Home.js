import { Box, Typography } from '@mui/material';
import { useContractState, useUserState } from '../lib/ContractConnector';

// function NFTPanel

export function Home() {
  const { items } = useContractState();
  // const { balance, items } = useUserState();
  console.log('items', items);
  return null;
  if (!items)
    return (
      <Box>
        <Typography>No items found</Typography>
      </Box>
    );
  return (
    <Box
      className="image-grid"
      maxWidth={1200}
      // alignItems="center"
      justifyContent="center"
      // display="flex"
      marginInline="auto"
      display="grid"
      gridTemplateColumns="repeat(auto-fill, 300px)"
      gap={10}
      // spacing={100}
      // flexWrap="wrap"
    >
      {items &&
        items.map((url, index) => {
          return (
            <Box key={index}>
              <img src={url.imageLink} />
            </Box>
          );
        })}
    </Box>
  );
}
