import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { reportType, format, status, dateRange } = await request.json();

    // Create CSV content for immediate download
    const sampleCsv = `Lead ID,Business Name,Contact Person,Phone Number,Email,Status,Category,City,State
10001,"Apex Logistics & Freight Solutions","Rajesh Verma","+91 98201 12345","rajesh@apexlogistics.in","interested","Logistics","Mumbai","Maharashtra"
10002,"BlueWave Digital Marketing","Sneha Kapoor","+91 98112 98765","sneha@bluewave.agency","contacted","Advertising","Gurugram","Haryana"
10003,"Vanguard Healthtech Labs","Dr. Arun Nair","+91 94470 55443","arun.nair@vanguardhealth.com","confirmed","Healthcare","Kochi","Kerala"
10004,"Zenith Precision Engineering","Karthik Sundaram","+91 98401 22334","karthik@zenithengineering.co","follow_up","Manufacturing","Chennai","Tamil Nadu"
10005,"GreenLeaf Agritech & Organics","Manpreet Kaur","+91 98140 88776","manpreet@greenleafagri.com","new","Agriculture","Ludhiana","Punjab"
10006,"UrbanCraft Modern Furniture","Amitabh Saxena","+91 99887 66554","info@urbancraft.co.in","pending","Retail","Bengaluru","Karnataka"
10007,"CloudScale Systems Private Ltd","Pooja Deshmukh","+91 98220 33445","pooja.d@cloudscale.io","interested","IT","Pune","Maharashtra"
10008,"SilverLine Jewellery Wholesalers","Ramesh Chordia","+91 94140 11223","sales@silverlinejewels.in","new","Gems","Jaipur","Rajasthan"`;

    return new NextResponse(sampleCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reportType || 'leads_report'}_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
