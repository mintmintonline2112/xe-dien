/**
 * API public POST /client/quote-requests: nhận form yêu cầu tư vấn (tư vấn, báo giá, trả góp, lái thử, đại lý) từ website, giới hạn 5 lần / phút.
 * Dùng bởi: quote-requests.module.ts; site gửi từ frontend-next/src/app/(site)/_components/forms.tsx.
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { QuoteRequestsService } from './quote-requests.service';

@ApiTags('Client - Quote Requests')
@Controller('client/quote-requests')
export class QuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  @Public()
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Gửi yêu cầu tư vấn từ website' })
  @ApiBody({ type: CreateQuoteRequestDto })
  create(@Body() body: CreateQuoteRequestDto) {
    return this.quoteRequestsService.submit(body);
  }
}
