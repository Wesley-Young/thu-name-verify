import { Box, Button, TextField, Typography } from '@mui/material';
import { hc } from 'hono/client';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import type { verifyRoute } from '../../../daemon/src/route/register';
import type { TsinghuaGitUserInfo } from '../types';

const rpcClient = hc<typeof verifyRoute>('/api/register');

function base64ToText(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [uin, setUin] = useState<number | null>(null);

  const base64Payload = searchParams.get('base64Payload');
  if (!base64Payload) return 'Something went wrong.';
  const { realName, studentId } = JSON.parse(base64ToText(base64Payload)) as TsinghuaGitUserInfo;

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
        <Typography variant={'h5'}>注册</Typography>
      </Box>
      <Typography>以下的信息是由系统自动生成的，无法修改。</Typography>
      <TextField label={'真实姓名'} value={realName} />
      <TextField label={'学号'} value={studentId} />
      <Typography>请输入你的 QQ 号：</Typography>
      <TextField label={'QQ 号'} value={uin ?? ''} onChange={(e) => setUin(Number(e.target.value))} />
      <Button
        size={'large'}
        variant={'contained'}
        sx={{ alignSelf: 'center' }}
        onClick={async () => {
          const reqId = searchParams.get('requestId');
          if (!reqId) {
            alert('Missing request ID');
            return;
          }
          if (!uin) {
            alert('请输入 QQ 号');
            return;
          }
          const res = await rpcClient.verify.$post({ json: { reqId, uin } });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              navigate(`/finalize?requestId=${reqId}&uin=${uin}`);
            } else {
              alert(data.message);
            }
          }
        }}
      >
        下一步
      </Button>
    </Box>
  );
}

export default Register;
