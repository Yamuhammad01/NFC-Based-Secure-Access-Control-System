import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { qrData, door, timestamp } = await req.json();
    
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock validation logic
    // Accept any QR data longer than 5 chars for simulation
    const isValid = qrData && qrData.length > 5;
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        userId: 'U' + Math.random().toString().slice(2,10),
        door,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }),
        role: 'Authorized Personnel'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid QR Code' }, 
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
