import { Box, Button, Typography } from '@mui/material';

function Landing() {
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
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant={'h4'}>姓名验证平台</Typography>
      </Box>
      <Typography>你将被重定向到 Tsinghua Git，请先通过统一身份认证系统登录。</Typography>
      <Typography>
        登录完毕后，你将回到注册页面。我们需要获取你的
        <b>真实姓名和学号</b>（Tsinghua Git 的 <code>read_user</code>{' '}
        权限）以确认你的身份。除此之外，不会读取任何其他信息。
      </Typography>
      <Button size={'large'} variant={'contained'} sx={{ alignSelf: 'center' }} href={'/api/register/fire'}>
        注册
      </Button>
    </Box>
  );
}

export default Landing;
