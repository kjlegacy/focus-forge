import { supabase } from './supabase';

/**
 * Fetches the currently logged-in user's profile data from Supabase.
 * Includes XP, Gold, Username, and Blacksmith Rank.
 */
export const fetchUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      console.warn("Profile not found for authenticated user in 'profiles' table.");
    }
    return data;
  } catch (err) {
    console.error("Critical error fetching profile:", err.message);
    return null;
  }
};

/**
 * Saves the chosen faction to the profile and initializes their inventory
 * with 5 Copper Ore.
 */
export const setFactionAndInitializeResources = async (faction) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("No authenticated user.");

    // Update the profile's faction
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ faction: faction })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // Get the Copper Ore ID
    const { data: oreData, error: oreError } = await supabase
      .from('ore_types')
      .select('id')
      .eq('name', 'Copper Ore')
      .single();

    if (oreError) throw oreError;

    // Initialize 5 Copper Ore
    const { error: resourceError } = await supabase
      .from('user_resources')
      .upsert({
        user_id: user.id,
        ore_id: oreData.id,
        quantity: 5
      }, { onConflict: 'user_id, ore_id' });

    if (resourceError) throw resourceError;

    return true;
  } catch (err) {
    console.error("Failed to initialize faction:", err.message);
    throw err;
  }
};
