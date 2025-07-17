import { supabase } from '@/lib/supabaseClient';

export async function updateMaterialWithHistory(
  materialId: string,
  newValue: number,
  newUnit: string
) {
  // 1. Get current (old) value before update
  const { data: current, error: fetchError } = await supabase
    .from('materials')
    .select('value, unit')
    .eq('id', materialId)
    .single();

  if (fetchError || !current) {
    console.error('Fetch error:', fetchError);
    return { error: fetchError || new Error('Material not found') };
  }

  const hasChanged = current.value !== newValue || current.unit !== newUnit;
  if (!hasChanged) return { message: 'No changes' };

  // 2. Perform the update on `materials`
  const { error: updateError } = await supabase
    .from('materials')
    .update({
      value: newValue,
      unit: newUnit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', materialId);

  if (updateError) {
    console.error('Update error:', updateError);
    return { error: updateError };
  }

  // ✅ 3. Only insert the NEW value into material_history
  const { error: historyError } = await supabase
    .from('material_history')
    .insert([
      {
        material_id: materialId,
        value: newValue,
        unit: newUnit,
      },
    ]);

  if (historyError) {
    console.error('History insert error:', historyError);
    return { error: historyError };
  }

  return { message: 'Material updated and new value saved in history.' };
}
