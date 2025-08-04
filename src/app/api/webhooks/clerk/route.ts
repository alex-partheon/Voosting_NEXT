import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Supabase 클라이언트 (서비스 롤)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  // Clerk 웹훅 검증을 위한 헤더들
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // 헤더 가져오기
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // 헤더가 없으면 오류 반환
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // 요청 본문 가져오기
  const payload = await req.text();
  const body = JSON.parse(payload);

  // 새 Svix 인스턴스 생성 (웹훅 검증용)
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 웹훅 검증
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // 이벤트 타입 확인 및 처리
  const { id } = evt.data;
  const eventType = evt.type;

  // eslint-disable-next-line no-console
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  // eslint-disable-next-line no-console
  console.log('Webhook body:', body);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // 사용자 프로필 생성
      const { error } = await supabase.from('profiles').insert({
        id: id,
        email: email_addresses[0]?.email_address || '',
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        role: 'creator', // 기본 역할
        referral_code: generateReferralCode(id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating profile:', error);
        return new Response('Error creating profile', { status: 500 });
      }

      // eslint-disable-next-line no-console
      console.log('Profile created successfully for user:', id);
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // 사용자 프로필 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({
          email: email_addresses[0]?.email_address || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating profile:', error);
        return new Response('Error updating profile', { status: 500 });
      }

      // eslint-disable-next-line no-console
      console.log('Profile updated successfully for user:', id);
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      return new Response('User ID not found', { status: 400 });
    }

    try {
      // 사용자 프로필 삭제 (또는 soft delete)
      const { error } = await supabase.from('profiles').delete().eq('id', id);

      if (error) {
        console.error('Error deleting profile:', error);
        return new Response('Error deleting profile', { status: 500 });
      }

      // eslint-disable-next-line no-console
      console.log('Profile deleted successfully for user:', id);
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}

/**
 * 추천 코드 생성 함수
 */
function generateReferralCode(userId: string): string {
  const userPart = userId.slice(-6).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${userPart}${randomPart}`;
}
