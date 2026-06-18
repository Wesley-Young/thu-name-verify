import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router';

function Finalize() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const uin = searchParams.get('uin');
  if (!requestId || !uin) return 'Something went wrong.';
  return (
    <Box
      sx={{
        height: '100%',
        width: '50%',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography>
        请在新生群中用 QQ 号 <b>{uin}</b> 发送：
      </Typography>
      <Typography sx={{ fontSize: '1.2rem', textAlign: 'center', backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2 }}>
        <code>verify {requestId}</code>
      </Typography>
      <Typography>发送完毕后，即可完成验证。</Typography>
    </Box>
  );
}

export default Finalize;
