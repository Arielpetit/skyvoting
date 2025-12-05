import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { participant_id, device_fingerprint } = await req.json();

    console.log('Vote request received:', { participant_id, device_fingerprint });

    if (!participant_id || !device_fingerprint) {
      return new Response(
        JSON.stringify({ error: 'Missing participant_id or device_fingerprint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this device has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('device_votes')
      .select('id, participant_id')
      .eq('device_fingerprint', device_fingerprint)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingVote) {
      console.log('Device has already voted:', existingVote);
      return new Response(
        JSON.stringify({ 
          error: 'already_voted', 
          participant_id: existingVote.participant_id,
          message: 'This device has already voted' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if participant exists
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, name, votes')
      .eq('id', participant_id)
      .single();

    if (participantError || !participant) {
      console.error('Participant not found:', participantError);
      return new Response(
        JSON.stringify({ error: 'Participant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the vote in device_votes table
    const { error: insertError } = await supabase
      .from('device_votes')
      .insert({
        device_fingerprint,
        participant_id
      });

    if (insertError) {
      // Handle unique constraint violation (race condition)
      if (insertError.code === '23505') {
        console.log('Race condition: device already voted');
        return new Response(
          JSON.stringify({ 
            error: 'already_voted', 
            message: 'This device has already voted' 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Error recording vote:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record vote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment the vote count
    const { error: updateError } = await supabase
      .from('participants')
      .update({ votes: participant.votes + 1 })
      .eq('id', participant_id);

    if (updateError) {
      console.error('Error updating vote count:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update vote count' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Vote recorded successfully for:', participant.name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        participant_id,
        participant_name: participant.name,
        message: `Vote recorded for ${participant.name}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
